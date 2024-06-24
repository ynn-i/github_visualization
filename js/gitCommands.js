// 가상의 Git 저장소 상태를 관리할 객체
let repoState = {
    isInitialized: false,
    files: [],
    staging: [],
    commits: [],
    currentBranch: 'master',
    branches: { 'master': null },
    trackedFiles: {}  // 파일 이름을 키로, 마지막 커밋 이후 변경 여부를 값으로 가집니다.
};


// Git 명령어 실행 함수
function executeGitCommand(command, arg) {
    switch (command) {
        case 'init':
            return gitInit();
        case 'add':
            return gitAdd(arg);
        case 'commit':
            return gitCommit(arg);
        case 'push':
            return gitPush();
        case 'status':
            return gitStatus();
        case 'log':
            return gitLog();
        default:
            return { success: false, message: '알 수 없는 명령어입니다.' };
    }
}

// git init
function gitInit() {
    if (repoState.isInitialized) {
        return { success: false, message: '저장소가 이미 초기화되어 있습니다.' };
    }
    repoState.isInitialized = true;
    return { success: true, message: '빈 Git 저장소가 초기화되었습니다.' };
}

// git add .
function gitAdd(file) {
    console.log('gitAdd called with file:', file);
    console.log('Current repoState:', JSON.stringify(repoState, null, 2));

    if (!repoState.isInitialized) {
        console.log('Repository not initialized');
        return { success: false, message: 'Git 저장소가 초기화되지 않았습니다.' };
    }

    let addedFiles = [];

    if (file === '.') {
        console.log('Adding all files');
        // 모든 파일을 스테이징 영역에 추가
        repoState.files.forEach(file => {
            if (!repoState.staging.includes(file)) {
                repoState.staging.push(file);
                addedFiles.push(file);
            }
        });
    } else if (repoState.files.includes(file)) {
        console.log('Adding specific file:', file);
        if (!repoState.staging.includes(file)) {
            repoState.staging.push(file);
            addedFiles.push(file);
        }
    } else {
        console.log('File not found in working directory:', file);
        return { success: false, message: '작업 디렉토리에 해당 파일이 없습니다.' };
    }

    console.log('Files added to staging:', addedFiles);
    console.log('Updated repoState:', JSON.stringify(repoState, null, 2));

    if (addedFiles.length > 0) {
        return {
            success: true,
            message: `다음 파일들이 스테이징 영역에 추가되었습니다: ${addedFiles.join(', ')}`,
            repoStatus: repoState
        };
    } else {
        return {
            success: true,
            message: '스테이징할 새로운 변경사항이 없습니다.',
            repoStatus: repoState
        };
    }
}

// git commit -m 'message'
function gitCommit(message) {
    if (!repoState.isInitialized) {
        return { success: false, message: 'Git 저장소가 초기화되지 않았습니다.' };
    }
    if (repoState.staging.length === 0) {
        return { success: false, message: '커밋할 변경사항이 없습니다.' };
    }
    const newCommit = {
        id: generateCommitId(),
        message: message,
        files: [...repoState.staging],
        parent: repoState.branches[repoState.currentBranch]
    };
    repoState.commits.push(newCommit);
    repoState.branches[repoState.currentBranch] = newCommit.id;

    // 커밋된 파일들의 상태를 업데이트
    repoState.staging.forEach(file => {
        repoState.trackedFiles[file] = false;  // 파일이 커밋되어 변경되지 않은 상태로 표시
    });

    repoState.staging = [];  // 스테이징 영역 비우기

    return {
        success: true,
        message: `새로운 커밋이 생성되었습니다: ${newCommit.id}`,
        repoStatus: repoState
    };
}

// git push
function gitPush() {
    if (!repoState.isInitialized) {
        return { success: false, message: 'Git 저장소가 초기화되지 않았습니다.' };
    }
    if (repoState.commits.length === 0) {
        return { success: false, message: '푸시할 커밋이 없습니다.' };
    }
    return { success: true, message: '변경사항이 원격 저장소에 푸시되었습니다.' };
}

// git status
function gitStatus() {
    if (!repoState.isInitialized) {
        return { success: false, message: 'Git 저장소가 초기화되지 않았습니다.' };
    }
    let status = `현재 브랜치: ${repoState.currentBranch}\n`;
    status += `스테이징된 파일: ${repoState.staging.join(', ') || '없음'}\n`;
    status += `변경된 파일: ${repoState.files.filter(f => !repoState.staging.includes(f)).join(', ') || '없음'}`;
    return { success: true, message: status };
}

// git log
function gitLog() {
    if (!repoState.isInitialized) {
        return { success: false, message: 'Git 저장소가 초기화되지 않았습니다.' };
    }
    if (repoState.commits.length === 0) {
        return { success: false, message: '커밋 히스토리가 없습니다.' };
    }
    let log = repoState.commits.map(commit =>
        `커밋: ${commit.id}\n메시지: ${commit.message}\n`
    ).join('\n');
    return { success: true, message: log };
}

// 파일 생성 함수
function createFile(filename) {
    if (!repoState.files.includes(filename)) {
        repoState.files.push(filename);
        repoState.trackedFiles[filename] = true;  // 새 파일은 변경된 것으로 표시
        return {
            success: true,
            message: `${filename} 파일이 생성되었습니다.`,
            repoStatus: repoState
        };
    }
    return {
        success: false,
        message: `${filename} 파일이 이미 존재합니다.`,
        repoStatus: repoState
    };
}

// 커밋 ID 생성 함수
function generateCommitId() {
    return Math.random().toString(36).substring(2, 10);
}

function getCurrentRepoState() {
    return { ...repoState };
}

// 외부에서 사용할 함수들을 노출
window.executeGitCommand = executeGitCommand;
window.createFile = createFile;
window.getCurrentRepoState = getCurrentRepoState;