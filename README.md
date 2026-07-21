# ngpro262_projek

# Git Workflow

This project uses **Git** and **GitLab** for version control. Each team member should work on their own branch and create a Merge Request when their work is ready to be reviewed. Avoid committing directly to the `main` branch.

## Getting Started

If this is your first time working on the project, clone the repository to your computer and navigate into the project folder.

```bash
git clone <repository-url>
cd <repository-name>
```

## Keeping Your Local Repository Up to Date

Before starting work each day, switch to the `main` branch and download the latest changes from the remote repository.

```bash
git checkout main
git pull origin main
```

This ensures that you are starting from the latest version of the project before creating or updating your own branch.

## Creating a Branch

Create a new branch for the feature or bug fix you are working on. Choose a descriptive branch name so that other team members can easily identify its purpose.

```bash
git checkout -b feature/your-feature-name
```

For example:

```bash
git checkout -b feature/login-page
```

After creating the branch, all of your work should be committed to this branch rather than directly to `main`.

## Making Changes and Committing

After making changes to the project, check which files have been modified.

```bash
git status
```

Stage your changes for commit.

```bash
git add .
```

Create a commit with a clear and descriptive message explaining what was changed.

```bash
git commit -m "Describe your changes"
```

Good commit messages make it easier for other developers to understand the history of the project.

## Pushing Your Branch

The first time you push a new branch to GitLab, use:

```bash
git push -u origin feature/your-feature-name
```

The `-u` option links your local branch with the remote branch so that future pushes only require:

```bash
git push
```

## Creating a Merge Request

Once your work is complete and has been pushed to GitLab:

1. Open the project in GitLab.
2. Select **Merge Requests** from the menu.
3. Click **New Merge Request**.
4. Select your feature branch as the **Source Branch**.
5. Select `main` as the **Target Branch**.
6. Add a meaningful title and description.
7. Create the Merge Request for review.

A team member can then review your changes before they are merged into the `main` branch.

## Switching Between Branches

To see all available branches, run:

```bash
git branch
```

To switch to another branch, use:

```bash
git checkout branch-name
```

For example:

```bash
git checkout main
```

or

```bash
git checkout feature/login-page
```

## Updating Your Branch

If changes have been made to the `main` branch while you were working, update your branch before continuing.

First, update your local copy of `main`:

```bash
git checkout main
git pull origin main
```

Next, switch back to your feature branch:

```bash
git checkout feature/your-feature-name
```

Merge the latest changes from `main` into your branch:

```bash
git merge main
```

If Git reports merge conflicts, resolve the conflicts in the affected files, stage the resolved files, and complete the merge by creating the merge commit.

```bash
git add .
git commit
```

Finally, push the updated branch:

```bash
git push
```

## Pulling Changes

If you are already working on your branch and simply want to download the latest changes from GitLab, use:

```bash
git pull
```

## Useful Commands

| Command                       | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `git status`                  | Show modified files and repository status.    |
| `git branch`                  | Display all local branches.                   |
| `git checkout branch-name`    | Switch to another branch.                     |
| `git checkout -b branch-name` | Create and switch to a new branch.            |
| `git add .`                   | Stage all modified files.                     |
| `git commit -m "message"`     | Save your changes locally.                    |
| `git push`                    | Upload commits to GitLab.                     |
| `git pull`                    | Download the latest changes from GitLab.      |
| `git merge branch-name`       | Merge another branch into the current branch. |
| `git log --oneline`           | View the commit history.                      |

Following this workflow helps keep the repository organized, reduces merge conflicts, and allows every team member's work to be reviewed before being merged into the main project.


## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.akademia.ac.za/die_divas_ngpro262/ngpro262_projek.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.akademia.ac.za/die_divas_ngpro262/ngpro262_projek/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
