const SHEET_ID = 'YOUR_SHEET_ID';

// Email addresses to receive notifications
const EMAIL_1 = 'diana_maria_erika@yahoo.com';
const EMAIL_2 = 'madalingarbeagabriel@gmail.com';

function doPost(e) {
  try {
    // Check if Sheet ID is set
    if (SHEET_ID === 'YOUR_SHEET_ID' || !SHEET_ID) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'error',
          'message': 'Sheet ID not configured. Please set SHEET_ID in the script.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'error',
          'message': 'Cannot access spreadsheet. Check that: 1) Sheet ID is correct, 2) Sheet is shared with the script owner, 3) Sheet exists.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active sheet
    const sheet = spreadsheet.getActiveSheet();
    
    // Parse the form data - handle both JSON and form-encoded
    let data = {};
    
    // Try to get data from parameters first (form-encoded)
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    }
    // Try to parse JSON from postData
    else if (e.postData && e.postData.contents) {
      try {
        const parsed = JSON.parse(e.postData.contents);
        if (parsed && typeof parsed === 'object') {
          data = parsed;
        }
      } catch (parseError) {
        // If JSON parsing fails, try to get from parameters
        data = e.parameter || {};
      }
    }
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Prepare row data with safe defaults
    const rowData = [
      timestamp,                              // Column A: Timestamp
      (data.name || '').toString(),          // Column B: Name
      (data.attending || '').toString(),     // Column C: Number of people
      (data.details || '').toString(),       // Column D: Details/Message
      (data.attendance || '').toString()     // Column E: Attendance (yes/no)
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Send email notifications
    try {
      sendEmailNotification(data);
    } catch (emailError) {
      // Email error is logged but doesn't fail the request
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data) {
  // Check if emails are configured
  if (!EMAIL_1 || !EMAIL_2 || EMAIL_1 === 'YOUR_EMAIL_1@example.com' || EMAIL_2 === 'YOUR_EMAIL_2@example.com') {
    return false;
  }
  
  try {
    // Format attendance text
    const attendanceText = data.attendance === 'yes' ? 'Da, confirm prezența' : 'Nu pot să particip';
    
    // Create email subject
    const subject = '🎉 Nouă confirmare RSVP - ' + (data.name || 'Invitat');
    
    // Create email body
    const body = `
Ceaules!

Ați primit un nou raspuns pentru nuntă aia bengoasa.

📋 Detalii confirmare:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nume: ${data.name || 'N/A'}
👥 Număr persoane: ${data.attending || 'N/A'}
✅ Confirmare prezență: ${attendanceText}
${data.details ? '💬 Mesaj: ' + data.details : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Va puuup,
IERI.SRL
    `.trim();
    
    // Send email to both addresses
    const emailAddresses = [EMAIL_1, EMAIL_2].filter(email => email && email.trim() !== '');
    
    if (emailAddresses.length > 0) {
      MailApp.sendEmail({
        to: emailAddresses.join(','),
        subject: subject,
        body: body
      });
      return true;
    }
    
    return false;
  } catch (error) {
    throw error;
  }
}
