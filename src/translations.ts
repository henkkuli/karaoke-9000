interface Translations {
    createProject: string;
    loadingProjectList: string;
    connectingToDatabase: string;
}

const fi: Translations = {
    createProject: 'Luo projekti',
    loadingProjectList: 'Ladataan projekteja',
    connectingToDatabase: 'Yhdistetään tietokantaan...',
};
const en: Translations = {
    createProject: 'Create project',
    loadingProjectList: 'Loading project list',
    connectingToDatabase: 'Connecting to database...',
};

export default function t(): Translations {
    return fi;
}
