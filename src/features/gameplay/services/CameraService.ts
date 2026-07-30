export class CameraService {
    private stream: MediaStream | null = null

    async startCamera(): Promise<MediaStream> {
        if (this.stream) {
            return this.stream
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error(
                "getUserMedia no está disponible. Asegúrate de acceder por HTTPS (o localhost) y haber concedido permisos de cámara."
            )
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 720,
                facingMode: "user",
            },
            audio: false,
        })

        return this.stream
    }


        stopCamera(): void {
            if(!this.stream) return
            
            this.stream.getTracks().forEach(t => t.stop())
            this.stream = null
        }
}