export default {
    context: [{
        id: 63,
        kind: 'project' // project|team|task
    }, {
        id: 14,
        kind: 'task'
    }],
    groups: [{
        kind: 'frequent',
        persons: [1, 25, 886]
    }, {
        kind: 'project_participants',
        persons: [886]
    }, {
        kind: 'project_members',
        persons: [4167]
    }, {
        kind: 'task_members',
        persons: [4578]
    }, {
        id: 1,
        kind: 'team',
        personal: true,
        avatar: {
            image: "//static.synccloud.com/avatars/m/549fc3c69cc04bc7ade63e2a479436c6.jpg",
            color: '#7986cb'
        },
        persons: [1, 25, 886, 4167, 4578]
    }, {
        id: 2,
        kind: 'team',
        name: 'SyncCloud',
        avatar: {
            color: '#4db6ac'
        },
        persons: [25, 886, 4578, 1111]
    }]
}
