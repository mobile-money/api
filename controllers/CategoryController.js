const { CategoryModel } = require('../models')
const BaseController = require('./BaseController')


class CategoryController extends BaseController {

  /**
   * 获取用户的分类列表
   */
  async getUserCategories ({ userId }) {
    const category = await CategoryModel.findOne({ user: userId })
    let categories = []

    if (category) {
      categories = category.categories.map(c => {
        return { name: c.name, id: c.id }
      })
    }

    this.ctx.body = categories
  }


  /**
   * 添加分类
   * 1. 不能超过 64 种分类
   */
  async createCategory ({ name }) {
    const userId = this.ctx.state.user.id
    let category = await CategoryModel.findOne({ user: userId })

    if (category) {
      if (category.categories.length >= 64) return this.error(403, 'The categories length can\'t exceed 64')
      category.categories.push({ name })

    } else {
      category = new CategoryModel({ user: userId, categories: [{ name }] })
    }

    await category.save()

    this.ctx.status = 200
  }


  /**
   * 修改分类
   */
  async updateCategory ({ categoryId, name }) {
    const userId = this.ctx.state.user.id
    const category = await CategoryModel.findOne({ user: userId, 'categories._id': categoryId })

    if (!category) return this.error(404, 'The category is not found')

    category.categories.find(c => c.id === categoryId).name = name
    await category.save()

    this.ctx.status = 200
  }


  /**
   * 删除分类
   */
  async deleteCategory ({ categoryId }) {
    const userId = this.ctx.state.user.id
    const category = await CategoryModel.findOne({ user: userId, 'categories._id': categoryId })

    if (!category) return this.error(404, 'The category is not found')

    category.categories = category.categories.filter(c => c.id !== categoryId)
    await category.save()

    this.ctx.status = 200
  }
}


module.exports = CategoryController
