" Obsidian Plugin VimRC Support
" https://github.com/esm7/obsidian-vimrc-support

" Yank to system clipboard
set clipboard=unnamed

" make space work
unmap <Space>

" Maps pasteinto to Alt-p
vmap <Space>p :pasteinto<cr>

" Navigate
map <C-n> <Down>
map <C-p> <Up>
nmap <C-n> <Down>
nmap <C-p> <Up>

exmap reload obcommand app:reload
map <Space>r :reload<cr>

exmap settings obcommand app:open-settings
map <Space>h :settings<cr>

exmap close obcommand workspace:close
map <Space>d :close<cr>

exmap delete obcommand app:delete-file
map <Space>D :delete<cr>

exmap only obcommand workspace:close-others
map <Space>o :only<cr>

exmap commands obcommand command-palette:open
map <Space>c :commands<cr>

exmap find obcommand switcher:open
map <Space>f :find<cr>

exmap link obcommand editor:insert-wikilink
imap <C-f> :link<cr>

" tab navigation
exmap next obcommand workspace:next-tab
nmap H :next<cr>

exmap prev obcommand workspace:next-tab
nmap L :prev<cr>

" searching
nmap s /

" Go back and forward with Ctrl+O and Ctrl+I
" (make sure to remove default Obsidian shortcuts for these to work)
exmap back obcommand app:go-back
nmap <C-o> :back<cr>
exmap forward obcommand app:go-forward
nmap <C-i> :forward<cr>

" splitting commands
exmap splitVertical obcommand workspace:split-vertical
nmap <C-w>v :splitVertical<cr>
exmap splitHorizontal obcommand workspace:split-horizontal
nmap <C-w>s :splitHorizontal<cr>

" window navigation commands
exmap focusRight obcommand editor:focus-right
nmap <C-w>l :focusRight<cr>
nmap <C-l>  :focusRight<cr>

exmap focusLeft obcommand editor:focus-left
nmap <C-w>h :focusLeft<cr>
nmap <C-h>  :focusLeft<cr>

exmap focusTop obcommand editor:focus-top
nmap <C-w>k :focusTop<cr>
nmap <C-k>  :focusTop<cr>

exmap focusBottom obcommand editor:focus-bottom
nmap <C-w>j :focusBottom<cr>
nmap <C-j>  :focusBottom<cr>

" Go to definition style for references
exmap definition obcommand editor:open-link-in-new-leaf
nmap gd :definition<cr>

" Open link in split
exmap split obcommand editor:open-link-in-new-split
nmap gv :split<cr>

" obsidian: side panel
exmap outline obcommand outline:open
nmap <Space>o :outline<cr>

exmap toggle_backlinks obcommand backlink:toggle-backlinks-in-document
map <Space>l :toggle_backlinks<cr>

exmap toggle_pin obcommand workspace:toggle-pin
map <Space>p :toggle_pin<cr>

" obsidian-neighbouring-files-plugin: commands
exmap next_file obcommand neighbouring-files:next
exmap prev_file obcommand neighbouring-files:prev

exmap next_file_alphabetical obcommand neighbouring-files:next-alphabetical
exmap prev_file_alphabetical obcommand neighbouring-files:prev-alphabetical

exmap newer_file_created obcommand neighbouring-files:older-created
exmap older_file_created obcommand neighbouring-files:newer-created

exmap next_file_modified obcommand neighbouring-files:next-modified
exmap prev_file_modified obcommand neighbouring-files:prev-modified

exmap folder_up obcommand neighbouring-files:folder-up
exmap folder_down obcommand neighbouring-files:folder-down
exmap folder_next obcommand neighbouring-files:folder-next
exmap folder_prev obcommand neighbouring-files:folder-prev

" obsidian-neighbouring-files-plugin: mappings
nmap n :next_file_alphabetical<cr>
nmap p :prev_file_alphabetical<cr>
nmap fu :folder_up<cr>
nmap fd :folder_down<cr>
nmap fn :folder_next<cr>
nmap fp :folder_prev<cr>
nmap gf :folder_next<cr>
nmap gb :folder_prev<cr>
