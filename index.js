
const s3Util = require('./s3-util'),
  path = require('path'),
  convert = require('./convert'),
  os = require('os'),
  EXTENSION = process.env.EXTENSION,
  OUTPUT_BUCKET = process.env.RESULTS_BUCKET_NAME,
  MIME_TYPE = process.env.MIME_TYPE;

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

exports.handler = function (eventObject, context) {
  const eventRecord = eventObject.Records && eventObject.Records[0],
    inputBucket = eventRecord.s3.bucket.name,
    key = eventRecord.s3.object.key,
    id = context.awsRequestId,
    resultKey = key + '_' + yyyy + mm + dd + EXTENSION,
    tempPath = path.join(os.tmpdir(),  id),
    convertedPath = path.join(os.tmpdir(), 'converted-' + id + EXTENSION);

  console.log('converting', inputBucket, key, 'using', tempPath);
  return s3Util.downloadFileFromS3(inputBucket, key, tempPath)
    .then(() => convert(tempPath, convertedPath))
    .then(() => s3Util.uploadFileToS3(OUTPUT_BUCKET, resultKey, convertedPath, MIME_TYPE));
};