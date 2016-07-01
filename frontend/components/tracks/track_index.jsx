const React = require('react');
const TrackIndexItem = require('./track_index_item');

module.exports = React.createClass({
  render () {
    // seperate tracks into rows
    const numTracks = this.props.tracks.length;
    const numRows = Math.ceil(numTracks / 4);
    const rows = [];
    for (let i = 0; i < numRows; i++) { rows.push([]); }
    for (let i = 0; i < numTracks; i++) {
      const RowIndex = Math.floor(i / 4);
      rows[RowIndex].push(this.props.tracks[i]);
    }
    return (
      <div className='track-index'>{
        rows.map(row => {
          return (
            <div key={row[0].id} className="track-index-row">{
              row.map(track => {
                return <TrackIndexItem key={track.id}
                                       track={track}
                                       indexType={this.props.indexType} />;
              })
            }</div>
          );
        })
      }</div>
    );
  }
});
