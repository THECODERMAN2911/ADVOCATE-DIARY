using Microsoft.Data.SqlClient;

// Migrates one firm's data from the legacy adiary_test into the modern AdvocateDiaryModern DB,
// preserving primary keys so all case/court/lawyer references stay intact.
const string legacyConn = "Server=115.124.106.98;Database=adiary_test;User Id=sa_adiary;Password=Unical@2025$9;TrustServerCertificate=True;Connection Timeout=60";
const string modernConn = "Server=localhost;Database=adiary_dev;User Id=CAP_User;Password=cap@2026;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True;Application Name=AdvocateDiaryMigration";
const string targetEmail = "ssamsani@yahoo.com";

using var src = new SqlConnection(legacyConn); src.Open();
using var dst = new SqlConnection(modernConn); dst.Open();

if (args.Contains("--cols"))
{
    foreach (var t in new[] { "CaseHistory_Dtls", "CasePayment_Dtls" })
    {
        Console.WriteLine($"=== {t} ===");
        using var cc = new SqlCommand("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=@t ORDER BY ORDINAL_POSITION", src);
        cc.Parameters.AddWithValue("@t", t);
        using var rr = cc.ExecuteReader();
        while (rr.Read()) Console.WriteLine("  " + rr[0]);
    }
    return;
}

int firmId;
using (var c = new SqlCommand("SELECT FirmID_FK FROM Lawyer_Mstr WHERE Email=@e", src))
{ c.Parameters.AddWithValue("@e", targetEmail); firmId = Convert.ToInt32(c.ExecuteScalar()); }
Console.WriteLine($"Migrating FirmID {firmId} ({targetEmail})...");

// --- helpers ---
static object N(object v) => v == DBNull.Value ? DBNull.Value : v;
static bool B(object v, bool dflt = false) => v == DBNull.Value ? dflt : Convert.ToBoolean(v);
DateTime Now = DateTime.UtcNow;
void Exec(string sql) { using var c = new SqlCommand(sql, dst); c.ExecuteNonQuery(); }
int Count(SqlConnection cn, string sql) { using var c = new SqlCommand(sql, cn); return Convert.ToInt32(c.ExecuteScalar()); }

// --- 1) wipe modern app data (keep seeded Plans / lookups) ---
Console.WriteLine("Clearing existing app data...");
foreach (var t in new[] { "Documents","NotificationLogs","CasePayments","CaseHistories","Cases",
                          "Courts","CaseTypes","CaseStages","RefreshTokens","PasswordResetTokens",
                          "Licenses","Payments","Users","Firms" })
    Exec($"DELETE FROM {t}");

// generic bulk copy from a legacy query to a modern table with IDENTITY_INSERT
int Copy(string table, string legacySql, string[] cols, Func<SqlDataReader, object?[]> map)
{
    using var read = new SqlCommand(legacySql, src);
    using var r = read.ExecuteReader();
    Exec($"SET IDENTITY_INSERT {table} ON");
    using var tx = dst.BeginTransaction();
    var colList = string.Join(",", cols);
    var paramList = string.Join(",", cols.Select((_, i) => "@p" + i));
    int n = 0;
    while (r.Read())
    {
        using var ins = new SqlCommand($"INSERT INTO {table} ({colList}) VALUES ({paramList})", dst, tx);
        var vals = map(r);
        for (int i = 0; i < vals.Length; i++) ins.Parameters.AddWithValue("@p" + i, vals[i] ?? DBNull.Value);
        ins.ExecuteNonQuery(); n++;
    }
    tx.Commit();
    Exec($"SET IDENTITY_INSERT {table} OFF");
    Console.WriteLine($"  {table}: {n}");
    return n;
}

// --- 2) Firm ---
Copy("Firms", $"SELECT * FROM Firm_Mstr WHERE FirmID_PK={firmId}",
    new[] { "Id","Name","Address","City","Phone","Email","LogoPath","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["FirmID_PK"], N(r["FirmName"]), N(r["Address1"]), DBNull.Value, DBNull.Value, DBNull.Value,
                         N(r["LogoImage"]), B(r["IsActive"], true), Now, DBNull.Value });

// --- 3) Users (password kept plaintext -> upgraded to BCrypt on first login; role FirmAdmin) ---
Copy("Users", $"SELECT * FROM Lawyer_Mstr WHERE FirmID_FK={firmId} AND Email IS NOT NULL AND Email<>''",
    new[] { "Id","FirmId","FullName","Email","Phone","PasswordHash","Role","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["LawyerID_PK"], r["FirmID_FK"], N(r["FullName"]), r["Email"], N(r["Phone"]),
                         r["Password"] == DBNull.Value ? "" : r["Password"], 1 /*FirmAdmin*/, B(r["IsActive"], true), Now, DBNull.Value });

// --- 4) Masters ---
Copy("Courts", $"SELECT * FROM Court_Mstr WHERE FirmId={firmId}",
    new[] { "Id","FirmId","Name","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CourtID_PK"], firmId, N(r["CourtName"]), B(r["IsActive"], true), Now, DBNull.Value });
Copy("CaseTypes", $"SELECT * FROM CaseType_Mstr WHERE FirmID={firmId}",
    new[] { "Id","FirmId","Name","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CaseTypeID_PK"], firmId, N(r["CaseType"]), B(r["IsActive"], true), Now, DBNull.Value });
Copy("CaseStages", $"SELECT * FROM CaseStage_Mstr WHERE FirmID={firmId}",
    new[] { "Id","FirmId","Name","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CaseStageID_PK"], firmId, N(r["StageDesc"]), B(r["IsActive"], true), Now, DBNull.Value });

// --- 5) Cases ---
string firmCasesJoin = $"FROM Case_Mstr c JOIN Lawyer_Mstr l ON c.LawyerID_FK=l.LawyerID_PK WHERE l.FirmID_FK={firmId}";
Copy("Cases", $"SELECT c.* {firmCasesJoin}",
    new[] { "Id","FirmId","CaseNumber","Title","Defendant","CourtId","CaseTypeId","CaseStageId","AppearingLawyerId",
            "FilingDate","PreviousDate","NextDate","PartyName","PartyAddress","PartyZip","PartyPhone","PartyPhone2",
            "PartyEmail","OppositeLawyer","FeeAgreed","FeeBalance","Tags","Remarks","SmsOptIn","EmailOptIn","IsStarred","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CaseID_PK"], firmId, r["CaseNumber"] == DBNull.Value ? "" : r["CaseNumber"],
                         r["Title"] == DBNull.Value ? "" : r["Title"], N(r["Defendant"]),
                         N(r["CourtID_FK"]), N(r["CaseTypeID_FK"]), N(r["CaseStageID_FK"]), N(r["LawyerID_FK"]),
                         N(r["FilingDate"]), N(r["PreviousDate"]), N(r["NextDate"]),
                         N(r["PartyName"]), N(r["PartyAddress"]), N(r["PartyZip"]), N(r["PartyPhone1"]), N(r["PartyPhone2"]),
                         N(r["PartyEmail1"]), N(r["OppositeLawyer"]),
                         r["FeeAgreed"] == DBNull.Value ? 0m : r["FeeAgreed"], r["FeeBalance"] == DBNull.Value ? 0m : r["FeeBalance"],
                         N(r["Tags"]), N(r["Remarks"]), B(r["SMS"]), B(r["Email"]), B(r["IsStarred"]), B(r["IsActive"], true), Now, N(r["ModifiedOn"]) });

// --- 6) Case history + payments (only for this firm's cases) ---
Copy("CaseHistories", $"SELECT h.* FROM CaseHistory_Dtls h JOIN Case_Mstr c ON h.CaseID_FK=c.CaseID_PK JOIN Lawyer_Mstr l ON c.LawyerID_FK=l.LawyerID_PK WHERE l.FirmID_FK={firmId} AND h.CaseID_FK IS NOT NULL",
    new[] { "Id","CaseId","HearingDate","Notes","IsActive","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CaseHistory_ID"], r["CaseID_FK"], r["HearingDate"] == DBNull.Value ? Now : r["HearingDate"],
                         N(r["Notes"]), B(r["IsActive"], true), Now, DBNull.Value });

Copy("CasePayments", $"SELECT p.* FROM CasePayment_Dtls p JOIN Case_Mstr c ON p.CaseID_FK=c.CaseID_PK JOIN Lawyer_Mstr l ON c.LawyerID_FK=l.LawyerID_PK WHERE l.FirmID_FK={firmId}",
    new[] { "Id","FirmId","CaseId","Amount","PaidOn","Mode","Notes","CreatedAt","UpdatedAt" },
    r => new object?[] { r["CasePaymentID_PK"], firmId, r["CaseID_FK"],
                         r["AmountReceived"] == DBNull.Value ? 0m : r["AmountReceived"],
                         r["RecDate"] == DBNull.Value ? Now : r["RecDate"], N(r["PaymentMode"]), DBNull.Value, Now, DBNull.Value });

Console.WriteLine("\nDone. Modern DB now has:");
foreach (var t in new[] { "Firms","Users","Courts","CaseTypes","CaseStages","Cases","CaseHistories","CasePayments" })
    Console.WriteLine($"  {t}: {Count(dst, $"SELECT COUNT(*) FROM {t}")}");
