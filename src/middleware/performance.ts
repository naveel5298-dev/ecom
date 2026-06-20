import {Express} from 'express';
import compression from 'compression';



export const applyPerformance = (app:Express)=>{
    app.use(compression({
    level: 6,          // balanced CPU vs size
    threshold: 1024,   // only compress > 1K
  }));
}