const csvSplitStream = require("csv-split-stream");
const fs = require("fs");

return csvSplitStream
  .split(
    fs.createReadStream(
      "D:\\STOCKAGE\\Work\\S10\\BigData\\Eval\\StockEtablissement_utf8.csv"
    ),
    {
      lineLimit: 30000,
    },
    (index) => fs.createWriteStream(`./output/sirene-${index + 1}.csv`)
  )
  .then((csvSplitResponse) => {
    console.log("csvSplitStream succeeded.", csvSplitResponse);
  })
  .catch((csvSplitError) => {
    console.log("csvSplitStream failed!", csvSplitError);
  });