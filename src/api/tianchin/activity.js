import request from '@/utils/request'

// 查询渠道列表
export function listActivity(query) {
    return request({
        url: '/tianchin/activity/page',
        method: 'get',
        params: query
    })
}

// 查询角色详细
export function getActivity(activityId) {
    return request({
        url: '/tianchin/activity/' + activityId,
        method: 'get'
    })
}

// 添加渠道
export function addActivity(data) {
    return request({
        url: '/tianchin/activity/create',
        method: 'post',
        data: data
    })
}

// 更新渠道
export function updateActivity(data) {
    return request({
        url: '/tianchin/activity/edit',
        method: 'put',
        data: data
    })
}

// 删除渠道
export function removeActivity(activityIds) {
    return request({
        url: '/tianchin/activity/' + activityIds,
        method: 'delete'
    })
}
