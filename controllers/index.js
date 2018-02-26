const AccountController = require('./AccountController')
const ArtController = require('./ArtController')
const BaseController = require('./BaseController')
const CategoryController = require('./CategoryController')
const CommentController = require('./CommentController')
const FeedController = require('./FeedController')
const FollowController = require('./FollowController')
const NoticeController = require('./NoticeController')
const SettingController = require('./SettingController')
const ShareController = require('./ShareController')
const StarController = require('./StarController')
const UserController = require('./UserController')


module.exports = {
  AccountController,
  Account: AccountController,
  ArtController,
  Art: ArtController,
  BaseController,
  Base: BaseController,
  CategoryController,
  Category: CategoryController,
  CommentController,
  Comment: CommentController,
  FeedController,
  Feed: FeedController,
  FollowController,
  Follow: FollowController,
  NoticeController,
  Notice: NoticeController,
  SettingController,
  Setting: SettingController,
  ShareController,
  Share: ShareController,
  StarController,
  Star: StarController,
  UserController,
  User: UserController,
}
