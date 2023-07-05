import { connection } from "./jsstore_con";

export class GoodsService {

    constructor() {

        this.tableName = "Goods";
    }
    //获取goods列表
    getGoodsList() {
        return connection.select({
            from: this.tableName,
        })
    }
    //添加单个goods
    addGoods(goods) {
        return connection.insert({
            into: this.tableName,
            values: [goods],
            return: true
        })
    }
    //批量添加
    addMultiGoods(goods) {
        return connection.insert({
            into: this.tableName,
            values: goods,
            return: true,
            upsert:true
        })
    }

    //根据goodsId查询
    getGoodsById(id) {
        return connection.select({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }
    //根据产品名称查询商品
    getGoodsByGoodsName(goods_name,pageSize,pageNum) {
        console.log('进来了',goods_name,pageSize,pageNum);
        return connection.select({
            from: this.tableName,
            limit:pageSize,
            skip:(pageNum - 1) * pageSize,
            where: {
                goods_name:{like:'%'+goods_name+'%'}
            }
        })
    }
    //移除商品
    removeGoods(id) {
        return connection.remove({
            from: this.tableName,
            where: {
                goods_id: id
            }
        })
    }

    removeAllGoods(){
        return connection.clear(this.tableName)
    }
    //更新商品
    // updateGoodsById(goods) {
    //     return connection.update({
    //         in: this.tableName,
    //         set: {
    //             name: goods.good_name,
    //             gender: goods.gender,
    //             country: goods.country,
    //             city: goods.city
    //         },
    //         where: {
    //             id: goods.id
    //         }
    //     })
    // }
}