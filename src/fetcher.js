export async function fetchContributions(userName, token, year = null) {
  const rangeArgs = year
    ? '(from: $from, to: $to)'
    : '';

  const variables = { userName };

  if (year) {
    const numericYear = Number(year);
    if (!Number.isInteger(numericYear) || numericYear < 2008 || numericYear > 2100) {
      throw new Error('CONTRIBUTION_YEAR must be a valid year between 2008 and 2100.');
    }
    variables.from = `${numericYear}-01-01T00:00:00Z`;
    variables.to = `${numericYear + 1}-01-01T00:00:00Z`;
  }

  const query = `
    query($userName:String!${year ? ', $from:DateTime!, $to:DateTime!' : ''}) {
      user(login: $userName) {
        contributionsCollection${rangeArgs} {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data?.user?.contributionsCollection) {
    throw new Error(`Unable to fetch contribution calendar for ${userName}.`);
  }

  return json.data.user.contributionsCollection;
}
