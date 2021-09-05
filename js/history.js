const history = {
    storage = window.localStorage,
    allHistory = JSON.parse(storage?.getItem("history") ?? "[]"),
    // TODO
    list:function(){

    },
    size: function(){
        return this.allHistory.size
    }
};
