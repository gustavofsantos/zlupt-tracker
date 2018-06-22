
### Packages

Theres two types of packages that runs into feed:
* Data modification: Used to keep data synchronized between peers
* Query operations: Used for peers to talk

## Data Modifications


#### Operations
* add: a new file is added in one peer (must sync with all peers)
* change: a file was changed in one peer (must propagate changes for all connected peers)
* remove: a file was removed (should delete the same file in all peers)
* addDir: a directore was created (should create the dame directory in all peers)

#### Query operations
* lastState: get the last state from all peers, select the newer 