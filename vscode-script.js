let messageBody = [];
const messageContainer = document.getElementById('messageContainer');
let interval;

let abcd = "asdasdad"

console.log(abcd)

form.addEventListener('submit', (e) => {
	e.preventDefault()
	handleFetch()
})

const handleLoading = (isLoading) => {
	if (isLoading) {
		messageContainer.innerHTML += `<div id="loadingparent" class="lg:max-w-[50vw] max-w-[80%] flex relative font-semibold w-32 px-6 py-3 bg-[#454545] rounded-lg bot">Thinking<p id="loading">.</div>`
		const loading = document.getElementById('loading');
		interval = setInterval(() => {
			if (loading.innerText.length < 4) {
				loading.innerText += "."
			} else {
				loading.innerText = "."
			}
		}, 500);
	} else {
		let loadingItem = document.getElementById('loadingparent')
		if (loadingItem) loadingItem.remove()
		clearInterval(interval)
		return
	}
}

const handleFetch = async () => {
	const form = document.getElementById('form');
	const data = new FormData(form);
	console.log(data)
	if (data.get('prompt').length >= 3) {
		messageBody.push({ message: data.get('prompt'), isUser: true, isError: false })
		renderMessages(messageBody)
		form.reset()
		handleLoading(true)
		fetch('https://openai-backend.vercel.app/chatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				prompt: data.get('prompt'),
				model: 'text-davinci-003'
			})
		})
			.then(async (res) => {
				const vscode = acquireVsCodeApi();
				const botResponse = await res.json();
				console.log(botResponse)
				let parsedData = ""
				parsedData = botResponse.text;
				let message = ""
				navigator.clipboard.writeText(parsedData)
				message = `${parsedData.trimStart().trimEnd().replace(/\n/g, "<br/>")}`
				messageBody.push({ message: message, isUser: false, isError: false })
				renderMessages(messageBody)
				vscode.postMessage({command: "message", text: "Copied to clipboard"})
				handleLoading(false)
			})
			.catch((err) => {
				handleLoading(false)
				let loadingItem = document.getElementById('loadingparent')
				if (loadingItem) loadingItem.remove()
				clearInterval(interval)
				console.log(err)
				messageBody.push({ message: "Something went wrong, Please try again later", isUser: false, isError: true });
				renderMessages(messageBody)
			})
	}
}

const renderMessages = (messageArray) => {
	messageContainer.innerHTML = "";
	messageArray.map((messageItem) => {
		if (messageItem?.isUser) {
			messageContainer.innerHTML += `<div class="lg:max-w-[50vw] max-w-[80%] flex self-end relative font-semibold w-max px-6 py-3 bg-[#1d3d3c] rounded-lg user">
		<p>${messageItem?.message}</p>
	</div>`
			messageContainer.scrollIntoView(false);
		} else {
			if (messageItem?.isError) {
				messageContainer.innerHTML += `<div class="lg:max-w-[50vw] max-w-[80%]  relative font-semibold w-max px-6 py-3 bg-[#8f4646] rounded-lg bot isError">
			<p>${messageItem?.message}</p>
		</div>`
			} else {
				messageContainer.innerHTML += `<div class="lg:max-w-[50vw] max-w-[80%]  relative font-semibold w-max px-6 py-3 bg-[#454545] rounded-lg bot">
	<p>${messageItem?.message}</p>
</div>`
			}
			messageContainer.scrollIntoView(false);
		}
	})
}