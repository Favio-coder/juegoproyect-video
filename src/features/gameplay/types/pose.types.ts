export interface Point2D {
    x: number 
    y: number
}

export interface Landmark extends Point2D{
    z: number
    visibility?: number
}

export interface PoseResult {
    landmarks: Landmark[]
    detected: boolean
    timestamp: number
}

