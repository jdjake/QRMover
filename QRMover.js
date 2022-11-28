function ParseDate(date) {
  dateString = date.toString();
  var fulldate = dateString.split(' ');

  var day = fulldate[0];
  var month = fulldate[1];
  var numday = fulldate[2];
  
  if (numday.charAt(0) === '0') { numday = numday.slice(1); }
  
  var year = fulldate[3];
  var time = fulldate[4];
  var brokentime = time.split(':');
  var hour = brokentime[0].replace(/^0+/, '');
  var minute = brokentime[1];
  var second = brokentime[2];

  return [day, month, numday, year, hour, minute, second];
}



function GetQRCodeFromEmail(message) {
  // If message is missing an attachment, there's a problem
  if (!(message.getAttachments())) {
    Logger.log("WE POTENTIALLY HAVE A PROBLEM WITH " + message);
  }

  var QRCodeAttachment = message.getAttachments()[0];
  var QRCodeFileName = QRCodeAttachment.getName();

  // Not necessarily a problem if Kanopy sent us
  // a different format, but could be a problem.
  if (QRCodeFileName !== 'qrcode.png') {
    Logger.log("POTENTIALLY A PROBLEM WITH AN ATTACHMENT CALLED: " + QRCodeFileName);
  }

  return QRCodeAttachment;
}

function emptyDocument(body) {
  // Add last paragraph in case there is no CF/LF
  body.appendParagraph('');

  // Delete each elements from document
  while (body.getNumChildren() > 1) body.removeChild( body.getChild( 0 ) );
}

function AddQRCodeToGoogleDoc(QRCode, day, numday, month, year) {
  // TODO: Access ID of Actual QR Google Doc
  var doc = DocumentApp.openByUrl(
    "https://docs.google.com/document/d/1NB90Neh1GD6CRuzpU38MGM3TeS_8rtklh_sh-edKXFo/edit?usp=sharing"
  );

  var body = doc.getBody();

  emptyDocument(body)

  var QRDescription = 'QR Code Updated On ' + day + ' ' + numday + ' / ' + month + ' / ' + year;
  Logger.log(QRDescription);
  var QRItem = body.appendParagraph(QRDescription + "\n");
  QRItem.appendInlineImage(QRCode);
}



function YourQRCodeConverter() {
  var unreadMessagesCount = GmailApp.getInboxUnreadCount();

  if (unreadMessagesCount > 0) {
    var threads = GmailApp.getInboxThreads(0, unreadMessagesCount);

    for (var i = 0; i < threads.length; i++) {
      // The zero in the line below means that you only reply
      // to the first email message in any chain of emails
      var message = threads[i].getMessages()[0]; 



      // Get data from email
      var email = message.getFrom();
      var body = message.getPlainBody();
      var subject = message.getSubject();
      var [day, month, numday, year, hour, minute, second] = ParseDate(message.getDate());

      // Get the explicit email address string from email
      var emailAddressString = email.replace(/^.+<([^>]+)>$/, "$1");



      // Logger.log(emailAddressString);
      // Logger.log("EMAIL FROM: " + emailAddressString + " WITH SUBJECT: " + subject);

      if (emailAddressString === "jcdenson@wisc.edu") {
          Logger.log("CAUGHT YA!");

        // Extract QR Code From Email Message
        var QRCode = GetQRCodeFromEmail(message);

        // Move QR Code to Google Doc
        AddQRCodeToGoogleDoc(QRCode, day, numday, month, year);

        // We Only Move The Most Recent Email Fitting Our Criteria To The Google Doc
        return;
      }
    }
  }
}