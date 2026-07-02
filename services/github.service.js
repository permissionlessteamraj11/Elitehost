const { Octokit } = require("@octokit/rest");

exports.getUserRepos = async (token) => {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100
  });
  return data.map(r => ({
    name: r.full_name,
    url: r.clone_url,
    private: r.private,
    updated_at: r.updated_at
  }));
};

exports.getRepoBranches = async (token, owner, repo) => {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.repos.listBranches({ owner, repo });
  return data.map(b => b.name);
};
