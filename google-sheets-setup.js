/**
 * Google Apps Script for Dezhyne Labs Onboarding Form
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Click "Extensions" > "Apps Script"
 * 3. Replace any code in the editor with this script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set Description: "Form Submissions"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- IMPORTANT
 * 9. Click "Deploy" and copy the "Web app URL" (ends in /exec)
 * 10. Paste the URL into `script.js` in SUBMISSION_ENDPOINT
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", message: "Dezhyne Labs Onboarding Form Endpoint is ready." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data;

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    // Set up headers automatically if the sheet is blank
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Full Name",
        "Contact Email",
        "Etsy Order Number",
        "Store Status",
        "Existing Store URL",
        "Theme Selection",
        "Brand Details & Logo",
        "Business Name & Industry",
        "Preferred Currency",
        "Other Currency",
        "Custom Domain",
        "Domain Name",
        "Essential Pages",
        "Social Media Links",
        "Website Content / Asset Link",
        "Product Setup",
        "Product Quantity",
        "Final Instructions"
      ];
      sheet.appendRow(headers);

      // Style header row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#f3f4f6");
    }

    var essentialPages = Array.isArray(data.essentialPages)
      ? data.essentialPages.join(", ")
      : (data.essentialPages || "");

    sheet.appendRow([
      new Date(),
      data.fullName || "",
      data.contactEmail || "",
      data.etsyOrderNumber || "",
      data.storeStatus || "",
      data.existingStoreUrl || "",
      data.themeSelection || (data.otherTheme ? ("Other: " + data.otherTheme) : ""),
      data.brandDetails || "",
      data.businessNameIndustry || "",
      data.preferredCurrency || "",
      data.otherCurrency || "",
      data.customDomain || "",
      data.domainName || "",
      essentialPages,
      data.socialMediaLinks || "",
      data.websiteContentAssetLink || "",
      data.productSetup || "",
      data.productQuantity || "",
      data.finalInstructions || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
