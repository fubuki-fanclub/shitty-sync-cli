const childProc = require("child_process")
const { magentaBright } = require("chalk");

const {ffprobe} = require('./ffmpeg-util')
const findStream = require('./find-stream')

async function main(args) {
    // get file info
    const data = await ffprobe(args[0]);

    //print out all streams
    console.log(magentaBright("Streams in source file:"));
    console.table(data.streams.map(stream => ({ type: stream.codec_type, codec: stream.codec_long_name, lang: stream.tags?.language ?? null, title: stream.tags?.title ?? stream.tags?.filename })))

    const videoStream = findStream.video(data),
        audioStream = findStream.audio(data, 'jpn'),
        subStream = await findStream.sub(data, 'eng');


    console.log(magentaBright("Output streams:"));
    console.table({ videoStream, audioStream, subStream }, ['index', 'tags']);
}

main(process.argv.slice(2));

//don't exit if inspector is attached
if (require('inspector').url()) {
    setInterval(() => 10e100)
}