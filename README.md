# OptimLoL
Champion Selection Optimization for League of Legends

To Run Code:

1. ```npm install```
2. Install foreman. ```gem install foreman``` https://github.com/ddollar/foreman
 - Optimlol runs off of Heroku which uses foreman and with Procfiles so that's how we test most things locally.
3. Create ```.env``` file in ```optimlol``` directory.  
    ```  
        MONGOLAB_URI='mongodb://username:password@url:port/riot_data'
        
        RIOT_API_KEY='riot_api_key'
        
        PORT=8080 #local api port
    ```
4. Run the optimlol_api. ```foreman start -e .env```
5. In another command console, run gulp. ```gulp debug-web```
6. Enjoy!


#License
GNU General Public License Version 3
http://www.gnu.org/licenses/gpl-3.0.txt
