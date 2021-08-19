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

module.exports = {
    $, ffmpegGetStream, ffprobe
}