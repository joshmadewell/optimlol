# OptimLoL
Champion Selection Optimization for League of Legends  
www.optimlol.com

To Run Code:

1. ```npm install``` && ```npm install -g gulp```
2. Install foreman. ```gem install foreman``` https://github.com/ddollar/foreman
 - Optimlol runs off of Heroku which uses foreman and with Procfiles so that's how we test most things locally.
3. You're going to need a mongo instance so either run one locally or get a free sandbox from [mongolab](www.mongolab.com)  
  3a. If you sign up for mongolab once logged in click 'Create New' under MongoDB Deployments and choose the sandbox option.  
  3b. Name your mongoDB 'riot_data'.  
  3c. Click on your new database and create a user.
4. Create ```.env``` file in ```optimlol``` directory.  
    ```  
        MONGOLAB_URI='mongodb://username:password@url:port/riot_data' #this can be your local instance or mongolabs...
        
        RIOT_API_KEY='riot_api_key'
        
        PORT=8080 #local api port

        NODE_ENV='development'
    ```
5. Run the optimlol_api. ```foreman start -e .env```
6. In another command console, run gulp. ```gulp debug-web```
7. Enjoy!


##Windows Dependency 
Do this first https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup

#License
GNU General Public License Version 3
http://www.gnu.org/licenses/gpl-3.0.txt
