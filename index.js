const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

// Replace with your tokens
const BITBUCKET_TOKEN = '';
const GITHUB_TOKEN = '';

// Replace with your Bitbucket workspace and GitHub organization/user
const BITBUCKET_WORKSPACE = 'sample_migration';
const GITHUB_ORG = 'aamodmigration';


// git clone https://sample_migration-admin@bitbucket.org/sample_migration/aamod_sample_project.git

// Function to get repositories from Bitbucket
async function getBitbucketRepos() {
    const url = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE}`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${BITBUCKET_TOKEN}` }
    });
    return response.data.values.map(repo => repo.slug);
}

// Function to create a repository on GitHub
async function createGitHubRepo(repoName) {
    console.log("repoName-222",repoName);
    
    const url = `https://api.github.com/orgs/${GITHUB_ORG}/repos`;
    const response = await axios.post(
        url,
        { name: repoName, private: false },
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    console.log("@@@@@@@@@",response.data);
    return response.data.clone_url;
}

// Function to migrate a repository
async function migrateRepo(repoName) {
    console.log("repoName-111",repoName);
    const bitbucketRepoUrl = `https://bitbucket.org/${BITBUCKET_WORKSPACE}/${repoName}.git`;
    // const bitbucketRepoUrl = 'https://sample_migration-admin@bitbucket.org/sample_migration/aamod_sample_project.git';

    const githubRepoUrl = await createGitHubRepo(repoName);

    console.log(`Migrating ${repoName}...`);
    exec(
        `git clone --mirror ${bitbucketRepoUrl} && cd ${repoName}.git && git remote add github ${githubRepoUrl} && git push --mirror github`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error migrating ${repoName}:`, error.message);
                return;
            }
            console.log(`Successfully migrated ${repoName}`);
        }
    );
}

// Main function
(async function () {
    try {
        const repos = await getBitbucketRepos();
        console.log(`Found ${repos.length} repositories:`, repos);

        for (const repo of repos) {
            await migrateRepo(repo);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();