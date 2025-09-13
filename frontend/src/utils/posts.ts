// 特定店舗の投稿を取得する
export async function getShopInfo(placeId: String) {
    const res = await fetch(`https://tabe-q.up.railway.app/queue/${placeId}`);
    const posts = await res.json();
    const postList = document.getElementById('post-list') as HTMLElement;
    const postForm = document.getElementsByName('postForm')[0] as HTMLFormElement;
    const isExistErrorElement = document.getElementsByClassName('no-post')[0] as HTMLParagraphElement;
    const now:Date = new Date();
    let anHourAgo:Date = new Date();
    anHourAgo.setHours(now.getHours() - 1);
    postList.innerHTML = '';
    if(posts.length > 0){
        postList.style.display = 'block';
        if(isExistErrorElement != null){
            isExistErrorElement.remove();
        }
        posts.forEach(post => {
            const liElement = document.createElement('li');
            const timeElement = document.createElement('span');
            timeElement.className = 'time';
            const commentElement = document.createElement('p');
            commentElement.className = 'comment';
            
            const utcCreatedAt:string = post.createdAt; //utcの日時
            const jstCreatedAt:string = new Date(utcCreatedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }); //jstの日時
            //1時間前は表示させない
            if(jstCreatedAt < anHourAgo.toLocaleString()){
                return;
            } 
            
            timeElement.textContent = jstCreatedAt;
            let comment:string = '';
            if(typeof post.comment === 'string'){
                comment = post.comment;
            }
            commentElement.textContent = comment;
            liElement.appendChild(timeElement);
            liElement.appendChild(commentElement);
            postList.appendChild(liElement);

        });
    } else{
        postList.style.display = 'none';
        if(isExistErrorElement == null){
            const errorElement = document.createElement('p');
            errorElement.classList.add('no-post');
            errorElement.textContent = '店舗の投稿はありません';
            postForm.before(errorElement);
        }
    }
}