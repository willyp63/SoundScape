const dispatcher = require('../dispatcher');

module.exports = {
 playTrack (track) {
   dispatcher.dispatch({
     actionType: 'SET_TRACK',
     track: track
   });
 },
 playTracks (tracks) {
   dispatcher.dispatch({
     actionType: 'SET_TRACKS',
     tracks: tracks
   });
 },
 removePlayingTrack (track) {
   dispatcher.dispatch({
     actionType: "REMOVE_PLAYING_TRACK",
     track: track
   });
 },
 replaceTrack (oldTrack, newTrack) {
   dispatcher.dispatch({
     actionType: 'REPLACE_PLAYING_TRACK',
     oldTrack: oldTrack,
     newTrack: newTrack
   });
 },
 closePlayer () {
   dispatcher.dispatch({
     actionType: 'CLOSE_PLAYER'
   });
 },
 likePlayingTrack (track) {
   dispatcher.dispatch({
     actionType: 'LIKE_PLAYING_TRACK',
     track: track
   });
 },
 unlikePlayingTrack (track) {
   dispatcher.dispatch({
     actionType: 'UNLIKE_PLAYING_TRACK',
     track: track
   });
 },
 playShuffledTracks (tracks) {
   dispatcher.dispatch({
     actionType: 'SET_TRACKS',
     tracks: tracks
   });
   dispatcher.dispatch({
     actionType: 'SHUFFLE_TRACKS'
   });
 },
 appendTrack (track) {
   dispatcher.dispatch({
     actionType: "APPEND_PLAYING_TRACK",
     track: track,
   });
 }
};
