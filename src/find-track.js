const {ffmpegGetStream} = require('./ffmpeg-util')
const {cyanBright,yellowBright} = require('chalk')

//#region VIDEO SELECTION
//not sure this is needed

function findVideoTrack(data) {
    console.info(cyanBright(`[VIDEO] picking the first (and hopefully only) video track`));

    return data.streams.find(stream => stream.codec_type === 'video');
}

//#endregion VIDEO SELECTION

//#region AUDIO SELECTION

function findAudioTrack(data, lang) {
    let audioTracks = data.streams.filter(stream => stream.codec_type === 'audio');
    console.info(cyanBright(`[AUDIO] Found ${audioTracks.length} audio tracks`));
    
    audioTracks = audioTracks.filter(audioTrack => audioTrack.tags.language === lang);
    
    console.info(cyanBright(`[AUDIO] ${audioTracks.length} match language '${lang}'`));
    if (audioTracks.length == 0) {
        console.warn(yellowBright('[AUDIO] No audio tracks left!'));
        return null;
    } else if (audioTracks.length == 1) {
        console.info(cyanBright('[AUDIO] Returning last remaining track'));
        return audioTracks[0];
    }
    
    console.warn(yellowBright('[AUDIO] Muliple audio tracks remaining. Returning the first one. (Open an issue if you encounter problems)'));
    return audioTracks[0];

}

//#endregion AUDIO SELECTION

//#region SUBTITLE SELECTION

async function subGetLength(data, subTrack) {
    return (await ffmpegGetStream(data.format.filename, subTrack.index, 'srt')).length;
}

async function findSubTrack(data, lang) {
    let subs = data.streams.filter(stream => stream.codec_type === 'subtitle');

    console.info(cyanBright(`[SUBS] Found ${subs.length} sub tracks`));
    if (subs.length == 0) {
        console.warn(yellowBright('[SUBS] No sub tracks found!'));
        return null;
    }

    subs = subs.filter(sub => sub.tags.language === lang);
    
    console.info(cyanBright(`[SUBS] ${subs.length} match language '${lang}'`));
    if (subs.length == 0) {
        console.warn(yellowBright('[SUBS] No sub tracks left!'));
        return null;
    } else if (subs.length == 1) {
        console.info(cyanBright('[SUBS] Returning last remaining track'));
        return subs[0];
    }

    console.info(cyanBright(`[SUBS] picking longest sub track`));
    const subTracksWithLengths = await Promise.all(subs.map(async subTrack =>
        ({ len: await subGetLength(data, subTrack), track: subTrack })
    ));
    const longest = subTracksWithLengths.reduce((prev,cur)=>cur.len > prev.len ? cur : prev,{len:0});
    console.info(cyanBright(`[SUBS] selected track ${longest.track.index}`));
    return longest.track;
}

//#endregion SUBITLE SELECTION

module.exports = {
    video: findVideoTrack,
    audio: findAudioTrack,
    sub: findSubTrack
}