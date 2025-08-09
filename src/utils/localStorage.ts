export const storage = (key: string,value?:any): any =>{
    if(value){
        localStorage.setItem(key, JSON.stringify(value));
    }else{
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
}