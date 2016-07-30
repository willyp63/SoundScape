class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  helper_method :current_user, :logged_in?

  private
  def current_user
    current_session = Session.find_by(session_token: session[:session_token])
    return nil unless current_session
    current_session.user
  end

  def logged_in?
    !!current_user
  end

  def login(user)
    new_session = Session.new(user_id: user.id, request_env: request.env['HTTP_USER_AGENT'])
    new_session.save!
    session[:session_token] = new_session.session_token
  end

  def logout
    Session.find_by(session_token: session[:session_token]).destroy!
    session[:session_token] = nil
  end

  def require_logged_in
    render json: {base: ['invalid credentials']}, status: 401 unless current_user
  end
end
