package in.ap.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class ClassVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Video Title
     */
    private String title;

    /*
     * Main Playback URL
     * Store HLS URL here
     */
    @Column(length = 2000)
    private String filePath;

    /*
     * Original MP4 URL
     */
    @Column(length = 2000)
    private String originalVideoUrl;

    /*
     * HLS Streaming URL
     * Example:
     * index.m3u8
     */
    @Column(length = 2000)
    private String hlsUrl;

    /*
     * application/x-mpegURL
     */
    private String contentType;

    /*
     * Original Video Size
     */
    private Long size;

    /*
     * Video Duration
     */
    private Long durationSeconds;

    @ManyToOne
    @JoinColumn(name = "class_id")
    @JsonIgnore
    private Class classs;

    /*
     * Video Description
     */
    @Column(length = 2000)
    private String description;

    /*
     * Transcript / Notes
     */
 
    private String transcript;

}