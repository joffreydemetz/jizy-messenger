import path from 'path';

import {
    LogMe,
    jPackConfig,
    generateLessVariablesFromConfig,
    deleteLessVariablesFile
} from 'jizy-packer';

const jPackData = function () {
    const lessBuildVariablesPath = path.join(jPackConfig.get('basePath'), 'lib/less/_variables.less');

    jPackConfig.sets({
        name: 'jMessenger',
        alias: 'jizy-messenger',
        lessVariables: {
            messengerFgColor: '#FFF',
            messengerBackdropColor: 'rgba(0, 0, 0, .4)',
            messengerSuccessBgColor: '#28a745',
            messengerInfoBgColor: '#17a2b8',
            messengerPrimaryBgColor: '#888',
            messengerWarningBgColor: '#ff8400',
            messengerDangerBgColor: '#dc3545'
        }
    });

    jPackConfig.set('onCheckConfig', () => { });

    jPackConfig.set('onGenerateBuildJs', (code) => {
        LogMe.log('Build lib/less/_variables.less');
        const lessVariables = jPackConfig.get('lessVariables') ?? {};
        const lessOriginalVariablesPath = path.join(jPackConfig.get('basePath'), 'lib/less/variables.less');
        generateLessVariablesFromConfig(lessOriginalVariablesPath, lessBuildVariablesPath, lessVariables);
        return code;
    });

    jPackConfig.set('onGenerateWrappedJs', (wrapped) => wrapped);

    jPackConfig.set('onPacked', () => {
        deleteLessVariablesFile(lessBuildVariablesPath);
    });
};

export default jPackData;
