import { Plugin } from 'obsidian';

export default class NeighbouringFileNavigator extends Plugin {

	async onload() {

		this.addCommand({
			id: 'next',
			name: 'Navigate to next file in folder',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) return
				const files = activeFile.parent?.children;
				if (!files) return
				const currentItem = files.findIndex(item => item.name === activeFile.name)
				const nextFile = files[(currentItem+1)%files.length]
				this.app.workspace.openLinkText(nextFile.path, '', false);
			}
		});

		this.addCommand({
			id: 'prev',
			name: 'Navigate to previous file in folder',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) return
				const files = activeFile.parent?.children;
				if (!files) return
				const currentItem = files.findIndex(item => item.name === activeFile.name)
				console.log("currentItem", currentItem)
				const prevFile = files[currentItem == 0 ? files.length-1 : (currentItem-1)%files.length]
				this.app.workspace.openLinkText(prevFile.path, '', false);
			}
		});

	}

	onunload() {

	}
}
