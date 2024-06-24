document.addEventListener('DOMContentLoaded', () => {
    const commandButtons = document.querySelectorAll('#command-panel button');
    const commitMessageInput = document.getElementById('commit-message');
    const fileNameInput = document.getElementById('file-name');
    const outputPanel = document.getElementById('command-output');

    // 명령어 버튼 이벤트 리스너 등록
    commandButtons.forEach(button => {
        button.addEventListener('click', handleCommandClick);
    });

    // 명령어 버튼 클릭 핸들러
    function handleCommandClick(event) {
        const command = event.target.id.replace('btn-', '');
        let result;

        switch (command) {
            case 'init':
            case 'status':
            case 'log':
                result = executeGitCommand(command);
                break;
            case 'add':
                result = executeGitCommand('add', '.');  // 여기를 수정
                break;
            case 'commit':
                const message = commitMessageInput.value.trim();
                if (message) {
                    result = executeGitCommand('commit', message);
                    commitMessageInput.value = '';
                } else {
                    result = { success: false, message: '커밋 메시지를 입력해주세요.' };
                }
                break;
            case 'push':
                result = executeGitCommand('push');
                break;
            case 'create-file':
                const fileName = fileNameInput.value.trim();
                if (fileName) {
                    result = createFile(fileName);
                    fileNameInput.value = '';
                } else {
                    result = { success: false, message: '파일 이름을 입력해주세요.' };
                }
                break;
        }

        displayResult(result);
        updateVisualization(getCurrentRepoState());
    }

    // 결과 표시 함수
    function displayResult(result) {
        outputPanel.textContent = result.message;
        outputPanel.style.color = result.success ? 'green' : 'red';
    }

    // 초기 시각화
    updateVisualization(getCurrentRepoState());  // 이 줄을 추가합니다.
});