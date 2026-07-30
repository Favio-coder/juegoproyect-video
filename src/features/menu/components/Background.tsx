import BackgroundVideo from "./BackgroundVideo";

export default function Background(){
    return(
        <>
            <BackgroundVideo></BackgroundVideo>

            <div className="absolute inset-0 bg-black/30"></div>
        </>
    )
}