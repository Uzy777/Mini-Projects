from pyvidplayer2 import Video
import pygame
import time


def start():
    while True:
        print("Hello ready to start")
        # time.sleep(3)
        print("1, 2, 3, 4, 5, 6, 7, 8, 9, 0")
        selection = input("Enter a number from the list above: ")

        if selection == "8" and selection.isdigit():
            print("Loading...")
            # time.sleep(10)
            skibidi()
        else:
            print("Go again...")


def skibidi():
    audio_file = "assets/audio.wav"
    pygame.mixer.music.load(audio_file)
    pygame.mixer.music.play()

    Video("assets/Skibidi.mp4", no_audio=True).preview()


start()
