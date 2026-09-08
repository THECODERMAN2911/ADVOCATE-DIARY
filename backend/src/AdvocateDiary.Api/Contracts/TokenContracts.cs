using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

namespace AdvocateDiary.Api.Contracts;

/// <summary>
/// OAuth2 token request (RFC 6749 §4.3 / §6), form-urlencoded. This shape exists so the Swagger UI
/// "Authorize" dialog can exchange a username + password for a bearer token by itself — the field
/// names are fixed by the spec, which is why they are snake_case rather than our usual JSON casing.
/// </summary>
public class TokenRequest
{
    /// <summary>"password" or "refresh_token".</summary>
    [FromForm(Name = "grant_type")]
    public string GrantType { get; set; } = "password";

    /// <summary>The user's login identity — their email address. Required for grant_type=password.</summary>
    [FromForm(Name = "username")]
    public string? Username { get; set; }

    /// <summary>Required for grant_type=password.</summary>
    [FromForm(Name = "password")]
    public string? Password { get; set; }

    /// <summary>Required for grant_type=refresh_token.</summary>
    [FromForm(Name = "refresh_token")]
    public string? RefreshToken { get; set; }
}

/// <summary>
/// OAuth2 token response. Swagger UI reads <c>access_token</c> and <c>token_type</c> off this to
/// build the Authorization header, so the property names must stay snake_case.
/// </summary>
public record TokenResponse(
    [property: JsonPropertyName("access_token")] string AccessToken,
    [property: JsonPropertyName("token_type")] string TokenType,
    [property: JsonPropertyName("expires_in")] int ExpiresIn,
    [property: JsonPropertyName("refresh_token")] string RefreshToken);

/// <summary>OAuth2 error response (RFC 6749 §5.2).</summary>
public record TokenErrorResponse(
    [property: JsonPropertyName("error")] string Error,
    [property: JsonPropertyName("error_description")] string ErrorDescription);
