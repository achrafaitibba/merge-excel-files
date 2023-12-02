var files = [];
var mergedData = [];

$(document).ready(function() {
    $('#select-files').on('change', function(e) {
        files = e.target.files;
    });

    $('#merge-btn').on('click', function() {
        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            reader.readAsBinaryString(files[i]);

            reader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var sheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[sheetName];
                var rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                // This part to check if you have a row that my have no data
                // Let take "website" column as an example
                // Check if "Website" column is empty and insert "noWebsite" if it is
                // Assuming that "website" column number is 3
                // Be careful with the column number
                if (rows[0][3] === "Website" && rows[0].length > 3) {
                    for (var k = 1; k < rows.length; k++) {
                        if (rows[k].length > 3 && rows[k][3] === "") {
                            rows[k][3] = "noWebsite";
                        }
                    }
                }
                
                if (mergedData.length === 0) {
                    mergedData.push(rows[0]); // keep header row
                }
                rows.shift(); // remove header row

                // This part to avoid duplacated rows
                // You can define a unique column, like "phoneNumber" in this example
                // Check if there is a row filled with the same number > skip it, else push data
                // Be careful with the column number
                for (var j = 0; j < rows.length; j++) {
                    var phoneNumber = rows[j][9]; // assuming phone number is in column 10
                    if (!mergedData.some(row => row[9] === phoneNumber)) {
                        mergedData.push(rows[j]);
                    }
                }
            };
        }

        setTimeout(function(){
            var mergedWorkbook = XLSX.utils.book_new();
            var mergedWorksheet = XLSX.utils.aoa_to_sheet(mergedData);
            XLSX.utils.book_append_sheet(mergedWorkbook, mergedWorksheet, 'Merged Data');
            var mergedFile = XLSX.write(mergedWorkbook, {bookType: 'xlsx', type: 'binary'});
            saveAs(new Blob([s2ab(mergedFile)], {type: 'application/octet-stream'}), 'merged-file.xlsx');
        },5000);
      
    }
    );
});

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);

    for (var i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }

    return buf;
}