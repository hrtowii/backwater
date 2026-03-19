> minna

> i was thinking of making a notetaking system / app where it's just you message yourself stuff

> so discord but not discord ...

> i think having links per channel and search/filter by date is kinda useful

> but obviously posting api keys in actual discord and pinning is a bit insecure

# backwater

- tauri app that acts as a discord notetaker for yourself
- message
  id
  mediaUrl:
  point to filepath
  respective to root
  uid: time in unix ms

date: unix ms
content: str:
limit 10k,
become media.txt

fk: channel

channel
id
message fk

pinned
primary key (messageid, channelid)
