import videoMenu from "../../../assets/videoMenu/videoMenu.mp4"

function BackgroundVideo(){
    return(
        <video 
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
        >
            <source src={videoMenu} type="video/mp4" />
        </video>
    )

}

export default BackgroundVideo