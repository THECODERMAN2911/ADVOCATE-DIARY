export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'How do I register at Advocate-Diary.com?',
    answer: 'Click the REGISTER NOW link on the home page and fill in the registration form that appears.',
  },
  {
    question: 'I did not receive an email after saving my details on the Registration page.',
    answer: 'You may have entered an incorrect or misspelled email address. Please complete the form again with the correct email ID, or email info@advocate-diary.com for further assistance.',
  },
  {
    question: 'I am not able to see any case item on the Home Page.',
    answer: 'This is because you have not scheduled a case for the selected day.',
  },
  {
    question: 'Why does the Calendar show some cases and not all the cases scheduled for the day?',
    answer: 'The Calendar is restricted to showing at most two cases so that you can see the whole calendar. Click “more…” to view all cases scheduled for that day.',
  },
  {
    question: 'Why are there only limited Case Stages in the Case Details section?',
    answer: 'You can add your own Case Stage if the relevant stage is not found in the field list.',
  },
  {
    question: 'Why are there only limited options in the Court of field in Case Details?',
    answer: 'You can add your own court if the relevant court is not found in the Court of field list.',
  },
  {
    question: 'How do I add a new case type?',
    answer: 'Click the icon next to the case type field, then enter the appropriate type to add it.',
  },
  {
    question: 'How do I add a new Case Stage?',
    answer: 'Click the icon next to the Case Stage field, then enter the appropriate stage to add it.',
  },
  {
    question: 'How do I add a new item in the Court of field?',
    answer: 'Click the icon next to the Court of field, then enter the appropriate court to add it.',
  },
  {
    question: 'Why am I not able to change the Case Title in Case Details?',
    answer: 'You cannot change the case title once the case has been created.',
  },
  {
    question: 'What are Starred Cases?',
    answer: 'You can tag important cases as starred. This makes it possible to keep track of important cases with a single click.',
  },
  {
    question: 'What do Pending Entries mean?',
    answer: 'Pending Entries help you track cases where the next hearing date has not been entered. You should enter this information daily. Cases are sorted by Next Date by default.',
  },
  {
    question: 'How can I refer fellow advocates, and will I receive any benefits?',
    answer: 'Enter your friends’ email addresses on the Refer Colleagues page and send them an invitation, or share your personal information link through social media. You can then receive the benefit of an extra 15 days.',
  },
];