const {createWriteStream, mkdirSync, existsSync} = require("fs");

const {path: ffmpegPath} = require("@ffmpeg-installer/ffmpeg");
const {getInfo, downloadFromInfo} = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

const SAMPLE_URL = "http://www.youtube.com/watch?v=A02s8omM_hI";
const TEMPORARY_DIRECTORY = "./tmp";
const OUTPUT_AUDIOT_FORMAT = "mp3";
const ARGS_BEGINNING_INDEX = 2;

main();

async function main() {
  createTemporaryDirectory();

  const {url, destination} = retrieveArgsFrom(process.argv);
  const {title, stream} = await downloadVideo(url);
  const audioStream = convertToMp3(stream);

  writeToFileSystem(audioStream, destination, title);
}

function retrieveArgsFrom(argv = []) {
  let args = argv.slice(ARGS_BEGINNING_INDEX);

  const url = args[0] || SAMPLE_URL;
  if (!url) throw new ReferenceError("A URL must be provided");

  const destination = args[1] || TEMPORARY_DIRECTORY;
  if (!destination) throw new ReferenceError("A destination path must be provided");

  return {url, destination};
}

async function downloadVideo(url) {
  let options = {
    videoFormat: "mp4",
    quality: "lowest",
    audioFormat: OUTPUT_AUDIOT_FORMAT
  };

  const info = await getInfo(url, options);

  return {title: info.title, stream: downloadFromInfo(info, options)};
}

function createTemporaryDirectory() {
  if (!existsSync(TEMPORARY_DIRECTORY)) {
    mkdirSync(TEMPORARY_DIRECTORY);
  }
}

function convertToMp3(videoStream) {
  return new ffmpeg(videoStream).format(OUTPUT_AUDIOT_FORMAT);
}

function writeToFileSystem(audioStream, destination, title) {
  audioStream.pipe(createWriteStream(destination + "/" + `${title}.${OUTPUT_AUDIOT_FORMAT}`));
}
