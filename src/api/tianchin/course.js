import request from '@/utils/request'

// 查询渠道列表
export function listCourse(query) {
    return request({
        url: '/tianchin/course/page',
        method: 'get',
        params: query
    })
}

// 查询角色详细
export function getCourse(courseId) {
    return request({
        url: '/tianchin/course/' + courseId,
        method: 'get'
    })
}

// 添加渠道
export function addCourse(data) {
    return request({
        url: '/tianchin/course/create',
        method: 'post',
        data: data
    })
}

// 更新渠道
export function updateCourse(data) {
    return request({
        url: '/tianchin/course/edit',
        method: 'put',
        data: data
    })
}

// 删除渠道
export function removeCourse(courseIds) {
    return request({
        url: '/tianchin/course/' + courseIds,
        method: 'delete'
    })
}
