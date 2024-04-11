const express = require('express')
const crypto = require('crypto')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const emoji = require('node-emoji')

const app = express()

app.use(express.json())

app.post('/send', (req, res) => {
	const data = req.body
	if (!data) return res.sendStatus(400)
	
	const signature = req.headers['x-hub-signature-256']
	if (!signature) return res.sendStatus(403)

	const HMAC = crypto.createHmac('sha256', process.env.SECRET_KEY)
	const hash = 'sha256=' + HMAC.update(JSON.stringify(data)).digest('hex')

	if (signature != hash) return res.sendStatus(403)

	var description = ""
	var index = 0
	for ( commitData of data.commits ) {
		if (index > 0) description = description + "\n"

		var commitMessage = commitData.message
		if ( emoji.unemojify(commitMessage).match('detective') ) {
			commitMessage = '🕵️ Конфиденциально'
		}

		description = description + `[\`${ commitData.id.substring(0, 7) }\`](${commitData.url}) ${commitMessage} | ${commitData.author.name}`
		index++
	}

	const commitCount = data.commits.length
	const commitCountStr = commitCount.toString()

	var commitWord = 'новых изменений'

	if ( commitCountStr.length == 1 ) {
		if (commitCount == 1) {
			commitWord = 'новое изменение'
		}
		else if (commitCount >= 2 && commitCount <= 4) {
			commitWord = 'новых изменения'
		}
	}
	else if ( !commitCountStr.startsWith('1') ) {
		if ( commitCountStr.endsWith('1') ) {
			commitWord = 'новое изменение'
		}
		else if ( commitCountStr.endsWith('2') || commitCountStr.endsWith('3') || commitCountStr.endsWith('4') ) {
			commitWord = 'новых изменения'
		}
	}

	const params = {
		"embeds": [
			{
				"title": `[${data.repository.name}:${data.ref.substring(11)}] ${commitCount} ${commitWord}`,
				"description": `${description}`,
				"url": `${data.compare}`,
				"color": 12812831,
				"author": {
					"name": `${data.sender.login}`,
					"url": `${data.sender.html_url}`,
					"icon_url": `${data.sender.avatar_url}`
				}
			}
		],
	}

	fetch(process.env.DISCORD_WEBHOOK, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(params)
	}) 

	res.sendStatus(200)
})

const port = process.env.PORT
app.listen(port, () => {
	console.log(`Application listening on port ${port}!`)
})