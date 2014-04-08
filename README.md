## Trollbot V2

Trollbot is an IRC I wrote in my spare time a long time ago. This is another IRC bot, but
instead of being a robust eggdrop replacement, this one has way different goals. My goals
are as follows.


### Ability to separate socket layer from the bot logic layer

This allows me to do a few different things. First off, the network communications layer
rarely is the part that changes, so this allows me to have things behind the scenes that
may crash. It also allows me to have many different things connect into the bot's IRC nickname.
You could have 200 different bots running represented only by one nickname, fancy that.



### Modules:

Modules connect into the IRC socket layer. Modules can request information from each other
and they all receive IRC events and can handle them as they see fit.


```
.__________. ._________. ._________.
|          | |         | |         |
| Channels | | Logger  | | Weather |
|__________| |_________| |_________|
           \      |      /
            \     |     /       
             \    |    /    
              \   |   /
               \  |  /
                \ | /
                 \|/
              .___|____.
              |        |
              | Socket |
              | Layer  |
              |________|
                  |
                  | 
           .______|______.
           |             |
           | IRC Network |
           |_____________|
```
