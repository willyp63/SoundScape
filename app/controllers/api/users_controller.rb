class Api::UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    if @user.save
      login(@user)
      render 'api/users/show'
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  def update
    @user = User.find(params[:id])
    if @user.is_password?(params[:user][:old_password])
      if @user.update(user_params)
        render 'api/users/show'
      else
        render json: @user.errors.full_messages, status: 422
      end
    else
      render json: ["That's not your old password"], status: 422
    end
  end

  private
  def user_params
    params.require(:user).permit(:username, :password, :picture_url)
  end
end
