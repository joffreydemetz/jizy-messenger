const jPackData = {
    name: 'jMessenger',
    alias: 'jizy-messenger',
    cfg: 'messenger',
    assetsPath: 'dist',

    buildTarget: null,
    buildZip: false,
    buildName: 'default',

    onCheckConfig: () => { },

    onGenerateBuildJs: (code) => code,

    onGenerateWrappedJs: (wrapped) => wrapped,

    onPacked: () => { }
};

export default jPackData;