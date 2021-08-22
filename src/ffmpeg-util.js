const childProc = require('child_process')

function $(strings, ...values) {
    let command = '';

    strings.forEach((str, i) => {
        command += str + (values[i] ?? '');
    });

    return new Promise((resolve, reject) => childProc.exec(command, (error, stdout) => {
        if (error) reject(error);
        resolve(stdout);
    }))
}

async function ffprobe(file) {
    return JSON.parse(await $`ffprobe -v quiet -print_format json -show_format -show_streams "${file}"`);
}

async function ffmpegGetStream(file, index, format) {
    return await $`ffmpeg -i "${file}" -map 0:${index} -f ${format} -`
}

function escapePath(path) {
    return path.replace(/[ \[\]]/g, (x)=>`\\${x}`);
}

async function ffmpegEncode(file,streamData,outFile) {
    const cmd = `ffmpeg -y -hide_banner -stats -i "${file}" -map 0:${streamData.video.index}\
 ${streamData.subtitles !== null ? `-vf subtitles="${escapePath(file)}":si="${streamData.subtitles.subIndex}"` : ''}\
 -c:v libx264  -map 0:${streamData.audio.index} -c:a aac -f mp4 -crf 23 -level 5.0 -preset slow -tune animation -bf 2 -g 90 "${outFile}"`;

    console.log(cmd);
    //runInteractive(cmd);
}

module.exports = {
    $, ffmpegGetStream, ffprobe,ffmpegEncode
}