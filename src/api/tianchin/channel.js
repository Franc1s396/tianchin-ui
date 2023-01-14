import request from '@/utils/request'

// 查询渠道列表
export function pageChannel(query) {
    return request({
        url: '/tianchin/channel/page',
        method: 'get',
        params: query
    })
}

export function listChannel() {
    return request({
        url: '/tianchin/channel/list',
        method: 'get',
    })
}

// 查询角色详细
export function getChannel(channelId) {
    return request({
        url: '/tianchin/channel/' + channelId,
        method: 'get'
    })
}

// 添加渠道
export function addChannel(data) {
    return request({
        url: '/tianchin/channel/create',
        method: 'post',
        data: data
    })
}

// 更新渠道
export function updateChannel(data) {
    return request({
        url: '/tianchin/channel/edit',
        method: 'put',
        data: data
    })
}

// 删除渠道
export function removeChannel(channelIds) {
    return request({
        url: '/tianchin/channel/' + channelIds,
        method: 'delete'
    })
}



