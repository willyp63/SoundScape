var io = require('socket.io-client');
var ss = require('socket.io-stream');
var BlobStream = require('blob-stream');
var WritableStream = require('stream').Writable;
var YtApiUtil = require('./yt_api_util');

let _socket = null;

module.exports = {
  downloadTrack (track, onStart, onChunk, onFinish) {
    YtApiUtil.searchYoutube(track, function (ytid, duration) {
      onStart(track, duration);
      downloadAudio(ytid, function () {
        onChunk(track);
      }, function (url) {
        track.audio_url = url;
        onFinish(track);
      });
    });
  }
};

function downloadAudio (ytid, onChunk, onFinish) {
  // connect to ytdl server
  if (_socket) { _socket.disconnect(); }
  _socket = io('https://thawing-bastion-97540.herokuapp.com/');

  // attempt to download audio
  var stream = ss.createStream();
  ss(_socket).emit('download', stream, {ytid: ytid});
  stream.pipe(new BlobStream())
    .on('finish', function () {
      var url = this.toBlobURL();
      onFinish(url);
    });

  // track download
  const ws = new WritableStream();
  ws._write = function (chunk, type, next) {
    console.log(`*Recieved Chunk for ytid:${ytid}*`);
    onChunk();
    next();
  };
  console.log(`***Begun Download for ytid:${ytid}***`);
  stream.pipe(ws).on('finish', function () {
    console.log(`***Finished Download for ytid:${ytid}***`);
  });
}
