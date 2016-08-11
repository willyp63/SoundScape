class Api::ReportsController < ApplicationController
  def create
    spotify_id = params[:report][:spotify_id]
    if spotify_id && !spotify_id.empty?
      track = Track.find_by(spotify_id: spotify_id)
      if track
        report = Report.new(track_id: track.id)
        report.save!
        render json: report
      else
        render json: ['no track found for spotify id!']
      end
    else
      render json: ['no spotify id!']
    end
  end

  def clear_track
    reports = Report.where(track_id: params[:track_id])
    reports.delete_all
    render json: reports
  end

  private
  def report_params
    params.require(:report).permit(:track_id, :spotify_id)
  end
end
